import { expect } from 'chai';
import * as proc from 'child_process';
//import isRunnable = require('../src/variants/isRunnable');
import * as ExitCode from '../src/types/codes';

describe('run criteria tests',() => {

    // runTest('will return 'does not exist' when no variant is found', 'ImNotAVariant', ExitCode.RunExitCode.DoesNotExist);
    // runTest('will return 'running ok' when a variant is in 'running' state, but has no processes', 'v0.1.0', ExitCode.RunExitCode.RunningOK);
    // runTest('will return 'not deployed' if a variant is in a failed deployment state', 'v0.1.1', ExitCode.RunExitCode.NotDeployed);
    // runTest('will return 'running ok' if a variant is deployed and not running', 'v0.2.0', ExitCode.RunExitCode.RunningOK);
});

function runTest(message: string, variantName: string, expected: ExitCode.RunExitCode) {
    // it(message, done => {
    //     async(() => {
    //         var result = await(isRunnable(variantName));
    //         expect(ExitCode.RunExitCode[expected]).to.equal(ExitCode.RunExitCode[result]);
    //         done();
    //     })().catch(done);
    // });
}
