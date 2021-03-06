import getSftpClient from './getSftpClient';
import exec from './exec';

/**
 * Delete a file on a Host
 */
export default async((host: Concierge.Host, filePath: string) => {
	const command = `rm ${filePath}`;
	const result = await(exec(host, command));
	return result;
});