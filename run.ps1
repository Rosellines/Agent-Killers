node src/cli.js self-test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node src/server.js
