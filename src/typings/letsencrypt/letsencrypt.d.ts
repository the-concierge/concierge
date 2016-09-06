declare module 'letsencrypt' {
    
    interface CreateOptions {
        server: string;
        configDir: string;
        privkeyPath: string;
        fullchainPath: string;
        certPath: string;
        chainPath: string;
        debug?: boolean
        webrootPath?: string;
    }
    
    interface CreateHandlers {
        setChallenge: (options: any, hostname: string, key: string, value: any, callback: Callback<any>) => void;
        removeChallenge: (options: any, hostname: string, key: string, callback: Callback<any>) => void;
        getChallenge: (options: any, hostname: string, key: string, callback: Callback<any>) => void;
        agreeToTerms?: (termsUrl: string, callback: Callback<any>) => void;
    }
    
    function create(options: CreateOptions, handlers: CreateHandlers): LetsEncryptInstance;
    
    function validate(hostnames: string[], callback: Callback<boolean>): void;        
    
    interface Callback<T> {
        (error?: any, result?: T): void;
    }
    
    interface LetsEncryptInstance {
        register(options: RegisterOptions, callback: Callback<CertificateResponse>): void;
        isValidDomain(hostname: string): boolean;
        validate(hostnames: string[], callback: Callback<boolean>): void;    
        registrationFailureCallback(error: any, args: RegisterFailureArgs, certInfo: any, callback: Callback<any>): void;
        renew(options: RegisterOptions, callback: Callback<CertificateResponse>): void;    
    }
    
    interface RegisterOptions {
        domains: string[];
        email: string;
        agreeTos: boolean;
    }
    
    interface RegisterFailureArgs extends RegisterOptions {
        configDir: string;
        fullchainTpl: string;
        privkeyTpl: string;
        webrootPathTpl: string;
        webrootPath: string;
    }
    
    interface CertificateResponse {
        /** fullchain.pem */
        cert: string;
        
        /** privkey.pem */
        key: string;
        
        /** date in milliseconds (unix timestamp) */
        renewedAt: number;
        
        /** duration til expiry in milliseconds */
        duration: number;
    }
    
    const productionServerUrl: string;
    const stagingServerUrl: string;
    const defaults: {
        privkeyPath: string,
        fullchainPath: string;
        certPath: string;
        chainPath: string;
        renewalPath: string;
        accountsDir: string;
        server: string;
        webrootPath?: string;
    }
    const configDir: string;
    const logsDir: string;
    const workDir: string;
    const knownUrls: string[];
    const knownEndPoints: string[];
    const liveServer: string;
    const stagingServer: string;
}