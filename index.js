const program = require('commander');
const r2 = require('r2');
const fs = require('fs');

const toBase64 = s => Buffer.from(s).toString('base64');
const fromBase64 = s => Buffer.from(s, 'base64').toString('ascii');

program
    .version(require('./package.json').version, '-v, --version')
    .option('-b, --base <base-url>', 'Base URL (protocol, host and kv path)')
    .option('-c, --config <config-path>', 'Config path')
    .option('-o, --output [output-path]', 'Output file path', '.env')
    .option('-u, --auth <user:password>', 'User and password')
    .parse(process.argv);

// TODO: Poor error handling

if (program.base && program.config && program.auth) {
    const getConfig = async (baseUrl, configPath, headers, filePath) => {
        const keysUrl = baseUrl + configPath + '?keys';
        try {
            console.log(`Getting keys from ${keysUrl}`)
            const keys = await r2(keysUrl, {headers}).json;
            // Each request to a key returns an array of objects, that have LockIndex, Key, Flags, Value, CreateIndex and ModifyIndex properties
            Promise.all(keys.map(async key =>
                r2(baseUrl + key, {headers}).json.then(json => {
                    // We will have only one element in the array
                    const e = json[0];
                    return  {
                        // Get the key name after the last '/'
                        key: e.Key.substring(e.Key.lastIndexOf('/') + 1),
                        // Value can be null, when empty
                        value: e.Value === null ? '' : fromBase64(e.Value)
                    };
                }).catch(e => console.log(e))
            ))
            .then(results => results.map(e => `${e.key}=${e.value}`))
            .then(lines => lines.join('\n'))
            .then(text => {
                fs.writeFile(filePath, text, err => {
                    if (err) {
                        return console.log(err);
                    }
                    console.log(`File ${filePath} was successfully saved!`);
                });
            });
        } catch (error) {
            console.log(error);
        }
    };

    const headers = {
        authorization: 'Basic ' + toBase64(program.auth)
    };
    getConfig(program.base, program.config, headers, program.output);
} else {
    program.outputHelp();
}
