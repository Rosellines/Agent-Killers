# Public Submission Protocol

A production verifier should accept a signed receipt plus immutable benchmark-pack metadata.

Minimum receipt fields:

- receipt schema
- signing algorithm
- suite id
- result ids
- agent/provider/model/version
- track
- score
- results digest
- public key
- signature

A remote verifier should independently re-fetch the benchmark commit and task pack, re-run the receipt digest, and reject mismatched oracle hashes.
