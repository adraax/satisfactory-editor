import { Connection } from "../interfaces/connection.interface";

export type ConnectionValidatorFn = (connection: Connection) => boolean;
export type ConnectionMode = "loose" | "strict";
