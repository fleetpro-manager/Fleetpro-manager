/**
 * Native Biometrics / Passkeys (WebAuthn API) Utility
 * Triggers the browser and mobile native biometric prompt (Fingerprint, Face ID, Screen lock).
 */

export const isNativeBiometricSupported = async (): Promise<boolean> => {
  if (!window.PublicKeyCredential) return false;
  try {
    // Check if the device is capable of local platform authenticator (TouchID, FaceID, Android Fingerprint, etc.)
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (e) {
    console.warn("Error checking native biometric capability:", e);
    return false;
  }
};

export const registerNativeBiometric = async (userId: string, username: string): Promise<any> => {
  if (!window.PublicKeyCredential) {
    throw new Error("WebAuthn is not supported on this browser/device.");
  }

  const randomChallenge = new Uint8Array(32);
  window.crypto.getRandomValues(randomChallenge);

  const rpId = window.location.hostname;

  // Configuration for local device biometric credential (platform authenticator)
  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge: randomChallenge,
    rp: {
      name: "FleetPro Transport Manager",
      id: rpId,
    },
    user: {
      id: Uint8Array.from(userId || "user_id_123", c => c.charCodeAt(0)),
      name: username || "user@fleetpro.com",
      displayName: username || "FleetPro User",
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },  // ES256 (commonly supported on mobile devices)
      { type: "public-key", alg: -257 } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Enforces native device platform authenticator (TouchID/FaceID/Fingerprint)
      userVerification: "required",
      residentKey: "required",
      requireResidentKey: true
    },
    timeout: 60000,
    attestation: "none"
  };

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });
    return credential;
  } catch (err: any) {
    console.error("Native Biometric Registration Failed:", err);
    throw err;
  }
};

export const authenticateNativeBiometric = async (): Promise<any> => {
  if (!window.PublicKeyCredential) {
    throw new Error("WebAuthn is not supported on this browser/device.");
  }

  const randomChallenge = new Uint8Array(32);
  window.crypto.getRandomValues(randomChallenge);

  const rpId = window.location.hostname;

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: randomChallenge,
    rpId: rpId,
    userVerification: "required",
    timeout: 60000
  };

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });
    return assertion;
  } catch (err: any) {
    console.error("Native Biometric Authentication Failed:", err);
    throw err;
  }
};
