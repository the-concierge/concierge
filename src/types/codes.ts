export enum RunExitCode {
  RunningOK = 0,
  DoesNotExist = 1,
  NotDeployed = 2,
  AlreadyRunning = 3,
  VariantBroken = 4
}

export enum DeleteExitCode {
  DeleteOK = 0,
  DoesNotExist = 1,
  AlreadyDeleted = 2,
  NotDeployed = 3,
  VariantIsRunning = 4,
  InsufficientRecentDeployments = 5
}

export enum DeployExitCode {
  DeployOK = 0,
  NoTagSupplied = 1,
  VariantAlreadyExists = 2,
  DatabaseUpdateFailed = 3,
  CloneFailed = 4,
  ExternalProcessFailure = 5
}

export enum StopExitCode {
  StopOK = 0,
  NotRunning = 1,
  DoesNotExist = 2,
  VariantIsActive = 3
}

export enum ActivateExitCode {
  ActivateOK = 0,
  VariantNotDeployed = 1,
  VariantBroken = 2,
  AlreadyAnActiveVariant = 3
}

export enum DeactivateExitCode {
  DeactivateOK = 0,
  VariantIsNotActive = 1,
  TargetVariantAndActiveVariantMismatch = 2
}

export enum ActiveConfigExitCode {
  Ok = 0,
  ConfigNotFound = 1
}

export enum NewContainerType {
  Normal,
  Fork,
  Change
}

export enum ErrorType {
  MakeDirectory,
  RemoveDirectory,
  ReadDirectory,

  WriteFile,
  RemoveFile,
  ReadFile,

  RunContainer,
  StopContainer,
  StartContainer,

  Connect
}