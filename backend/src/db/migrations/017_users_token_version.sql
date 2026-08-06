-- Permette di revocare gli access token JWT già emessi (stateless) prima della loro
-- scadenza naturale: il claim "tv" nel token viene confrontato con questo valore ad
-- ogni richiesta autenticata, incrementandolo ad ogni cambio/reset password.
ALTER TABLE users ADD COLUMN token_version int NOT NULL DEFAULT 0;
