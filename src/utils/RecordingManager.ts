import RecordRTC from 'recordrtc';

/**
 * Audio-specific MIME types supported by RecordRTC
 */
type AudioMimeType = 
    | "audio/wav"
    | "audio/webm"
    | "audio/webm;codecs=pcm"
    | "audio/ogg";

/**
 * Valid number of audio channels for RecordRTC
 */
type AudioChannels = 1 | 2;

/**
 * Configuration options for audio recording that match RecordRTC requirements
 */
interface AudioRecorderOptions {
    type: 'audio';
    mimeType: AudioMimeType;
    recorderType: typeof RecordRTC.StereoAudioRecorder;
    numberOfAudioChannels: AudioChannels;
    desiredSampRate: number;
    timeSlice?: number;
}

/**
 * Manages audio recording functionality using RecordRTC.
 * This class specifically handles audio-only recording for voice notes.
 */
export class AudioRecordingManager {
    private recorder: RecordRTC | null = null;
    private stream: MediaStream | null = null;

    // Add backup blob storage
    private recordingBackup: Blob | null = null;
    private backupInterval: number | null = null;

    private readonly AUDIO_CONFIG: AudioRecorderOptions = {
        type: 'audio',
        mimeType: "audio/wav",  // Reverted to WAV format
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1 as AudioChannels, // Set to single audio channel
        desiredSampRate: 44100,   // Set sample rate to 44100 Hz
        // Note: RecordRTC does not provide a direct option for bits per sample.
        timeSlice: 1000           // ...existing code...
    };

    /**
     * Initializes the recording manager with microphone access
     */
    async initialize(): Promise<void> {
        try {
            // Check if browser supports getUserMedia
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Browser does not support audio recording');
            }

            // Request microphone access with detailed constraints
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,      
                    noiseSuppression: true,
                    autoGainControl: true,
                    // Optimize for voice
                    channelCount: 1,
                    sampleRate: 44100
                }
            });

            // Verify we got an audio track
            const audioTracks = this.stream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('No audio track available');
            }

            // Initialize recorder with backup handling
            this.recorder = new RecordRTC(this.stream, {
                ...this.AUDIO_CONFIG,
                timeSlice: 1000,
                ondataavailable: (blob: Blob) => {
                    this.recordingBackup = blob;
                }
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            // Provide more specific error messages
            if (error instanceof Error) {
                switch (error.name) {
                    case 'NotAllowedError':
                        throw new Error('Microphone access denied by user');
                    case 'NotFoundError':
                        throw new Error('No microphone found');
                    case 'NotReadableError':
                        throw new Error('Microphone is already in use');
                    default:
                        throw new Error(`Failed to access microphone: ${errorMessage}`);
                }
            }
            
            throw new Error('Failed to initialize recording system');
        }
    }

    /**
     * Starts audio recording without enforcing a maximum duration
     */
    start(): void {
        if (!this.recorder) {
            throw new Error('Audio recorder not initialized');
        }
        this.recorder.startRecording();
    }

    /**
     * Pauses audio recording
     */
    pause(): void {
        if (!this.recorder) return;
        this.recorder.pauseRecording();
    }

    /**
     * Resumes audio recording
     */
    resume(): void {
        if (!this.recorder) return;
        this.recorder.resumeRecording();
    }

    /**
     * Stops recording with enhanced error handling and resource cleanup
     * 🎯 Mobile-optimized with proper error handling and resource management
     */
    async stop(): Promise<Blob | null> {
        if (!this.recorder) {
            return this.recordingBackup;
        }

        if (this.recorder.state === 'inactive') {
            return this.recordingBackup;
        }

        // Set a flag to track if we're in the stopping process
        let isStoppingInProgress = false;

        return new Promise((resolve, reject) => {
            try {
                // Prevent multiple stop attempts
                if (isStoppingInProgress) {
                    return;
                }

                isStoppingInProgress = true;

                // Set a timeout to prevent hanging
                const timeoutId = setTimeout(() => {
                    this.cleanup();
                    resolve(this.recordingBackup);
                }, 5000); // 5 second timeout

                // Non-null assertion is safe here because we checked recorder exists above
                this.recorder!.stopRecording(async () => {
                    try {
                        clearTimeout(timeoutId);
                        
                        // Get blob with error handling
                        let blob: Blob | null = null;
                        try {
                            blob = this.recorder?.getBlob() || null;
                            
                            if (!blob) {
                                throw new Error('Failed to get recording blob');
                            }

                            // Set the appropriate filename and type
                            Object.defineProperty(blob, 'name', {
                                value: `recording-${new Date().getTime()}.wav`,
                                writable: true
                            });

                            // Verify blob is valid
                            if (blob.size === 0) {
                                blob = this.recordingBackup;
                            }

                        } catch (error) {
                            this.cleanup();
                            resolve(this.recordingBackup);
                            return;
                        }

                        // Clean up resources immediately after getting the blob
                        this.cleanup();
                        resolve(blob);
                    } catch (error) {
                        this.cleanup();
                        resolve(this.recordingBackup);
                    }
                });
            } catch (error) {
                this.cleanup();
                resolve(this.recordingBackup);
            }
        });
    }

    /**
     * Cleans up recording resources with enhanced error handling
     * 🧹 Aggressively cleans up resources to prevent memory leaks
     */
    cleanup(): void {
        // Clean up recorder
        if (this.recorder) {
            try {
                // Force stop recording if still active
                if (this.recorder.state !== 'inactive') {
                    this.recorder.stopRecording();
                }
                this.recorder.destroy();
            } catch (error) {
            } finally {
                this.recorder = null;
            }
        }

        // Clean up media stream
        if (this.stream) {
            try {
                const tracks = this.stream.getTracks();
                tracks.forEach(track => {
                    try {
                        track.stop();
                        this.stream?.removeTrack(track);
                    } catch (error) {
                        // Silently handle individual track cleanup errors
                    }
                });
            } finally {
                this.stream = null;
            }
        }

        // Force garbage collection hint
        if (window.gc) {
            try {
                window.gc();
            } catch (error) {
                // Silently ignore GC errors
            }
        }

        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
        }
        
        this.recordingBackup = null;
    }

    /**
     * Gets the current state of the audio recorder
     */
    getState(): string {
        return this.recorder ? this.recorder.state : 'inactive';
    }

    /**
     * Checks if the recorder is currently recording
     */
    isRecording(): boolean {
        return this.getState() === 'recording';
    }

    /**
     * Checks if the recorder has been initialized
     */
    isInitialized(): boolean {
        return this.recorder !== null;
    }
}
