import { resolve } from 'path';

export default function getPath() {
	return resolve(__dirname, '..', '..', '..', 'archive');
}