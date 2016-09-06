declare module "node-dockerfile" {
    var api: typeof DockerFileBuilder;
	export = api;
}

declare class DockerFileBuilder {
	from(image: string): DockerFileBuilder;
	maintainer(maintainer: string): DockerFileBuilder;
	run(instructions: string|string[]): DockerFileBuilder;
	cmd(instructions: string|string[]): DockerFileBuilder;
	label(key: string, value: string): DockerFileBuilder;
	expose(port: number): DockerFileBuilder;
	env(key: string, value: string): DockerFileBuilder;
	add(source: string, destination: string): DockerFileBuilder;
	copy(source: string, destination: string): DockerFileBuilder;
	entryPoint(instructions: string|string[]): DockerFileBuilder;
	volume(volume: string): DockerFileBuilder;
	workDir(path: string): DockerFileBuilder;
	user(user: string): DockerFileBuilder;
	onBuild(instructions: string): DockerFileBuilder;
	comment(comment: string): DockerFileBuilder;
	newLine(): DockerFileBuilder;
	write(writeLocation: string, replaceExisting: boolean, callback: DockerCallback): void;	
}

interface DockerCallback {
	(error: any, content: string): void;
}