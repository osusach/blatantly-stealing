CREATE TABLE offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    url TEXT NOT NULL,
    seniority TEXT NOT NULL CHECK (seniority IN ('NOEXPERIENCE', 'JUNIOR')),
    salary TEXT,
    location TEXT NOT NULL,
    published_at TIMESTAMP NOT NULL,
    source TEXT NOT NULL
);

-- Create indexes for commonly queried fields
CREATE INDEX idx_offers_seniority ON offers(seniority);
CREATE INDEX idx_offers_location ON offers(location);
CREATE INDEX idx_offers_published_at ON offers(published_at);
CREATE INDEX idx_offers_source ON offers(source);