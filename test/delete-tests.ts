import { expect } from 'chai';
import db from '../src/data/connection';
import * as ExitCode from '../src/types/codes';

describe('deletion criteria tests',() => {
    // deleteTest('will find variant is not deletable because it is running', 'v0.1.0', ExitCode.DeleteExitCode.VariantIsRunning);
    // deleteTest('will find variant is deletable because there are 4 more recent deployments', 'v0.2.0', ExitCode.DeleteExitCode.DeleteOK);
    // deleteTest('will find variant is not deletable because there are only 3 more recent deployments', 'v0.3.0', ExitCode.DeleteExitCode.InsufficientRecentDeployments);
    // deleteTest('will find variant is deletable because it is a failed deployment', 'v0.1.1', ExitCode.DeleteExitCode.DeleteOK);
    // deleteTest('will find variant is not deletable because it doesn't exist', 'v1.0.0', ExitCode.DeleteExitCode.DoesNotExist);
    // deleteTest('will find variant is not deletable because it is already marked as deleted', 'v0.1.2', ExitCode.DeleteExitCode.AlreadyDeleted);
});

function deleteTest(message: string, variantName: string, expected: ExitCode.DeleteExitCode) {
    // it(message, done => {
    //     var promise = isDeletable(variantName);
    //     promise.then(code => {
    //         expect(ExitCode.DeleteExitCode[expected]).to.equal(ExitCode.DeleteExitCode[code]);
    //         done();
    //     }).catch(done);
    // });
}
