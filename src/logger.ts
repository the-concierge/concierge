import chalk = require("chalk");
/**
* Placeholder for logging
*/

export function info(message: string): void {

    formatOutput(message, "info", "cyan");
}

export function warn(message: string): void {
    formatOutput(message, "warn", "yellow");
}

export function error(message: string): void {
    formatOutput(message, "error", "red");
}

export function debug(message: string): void {
    formatOutput(message, "debug", "gray");
}

function formatOutput(message: string, messageType: string, color: string): void {
    console.log("[%s] %s: %s", new Date().toTimeString().slice(0, 8), chalk[color](messageType.toLocaleUpperCase()), message);
}