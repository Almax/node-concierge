import * as log from '../../logger';
import getSftpClient from './getSftpClient';

export default function read(host: Concierge.Host, filePath: string): Promise<Buffer> {
    return getSftpClient(host)
        .then(client => readFile(client, filePath));
}

function readFile(client, filePath: string) {
    var promise = new Promise<Buffer>((resolve, reject) => {
        var handlerThrown = false;

        function readFileHandler(error, response) {
            
            // For reasons unknown, .readFile() now calls the handler on completion and on error
            if (!handlerThrown) {
                handlerThrown = true;
                client.end();
            }
            
            // If we get an error, but we have a response, turn a blind eye 
            if (error && !response) {
                return reject('[READFILE] Failed to read file: ' + error);
            }
            resolve(new Buffer(response));
        }
        client.readFile(filePath, {}, readFileHandler);

    });

    return promise;
}

function isNoSuchFileError(errorMessage: string) {
    return errorMessage.indexOf('No such file') >= 0;
}