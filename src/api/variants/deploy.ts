import buildImage from './build';
import push from './push';
import saveVariant from './save';
import update from './update';
import * as states from '../../types/states';
import DeployedState = states.DeployedState;
import * as getVariants from './get';
import registryHasImage from '../registry/hasImage';
import * as log from '../../logger';
import registryIsOnline from '../registry/isOnline';

/**
 * If the image exists on the registry, do not build and deploy the image.
 * This will cause the image/variant to be pulled if the host doesn't already have it
 */
export default async function deploy(application: Concierge.Application, tag: string) {
    log.info(`[DEPLOY] Attempting to deploy variant '${tag}'`);

    const isRegistryOnline = await registryIsOnline();
    if (!isRegistryOnline) {
        throw new Error('Docker Registry is not available');
    }

    const canDeployTag = await isTagDeployable(tag);
    if (!canDeployTag) {
        throw new Error('Tag is not deployable');
    }

    // If the image is on the registry, we do not need to build and deploy
    const isAlreadyDeployed = await registryHasImage(tag);
    if (isAlreadyDeployed) {
        const newVariantId = await saveVariant(application.id, tag, DeployedState.Deployed);
        return true;
    }

    const deployResult = await deployImage(application, tag);
    const newVariantId = await saveVariant(application.id, tag, DeployedState.Deployed);
    return deployResult;
}

async function deployImage(application: Concierge.Application, tag: string) {
    if (!tag || tag.length === 0) {
        throw new Error('Invalid deploy request: Must provide a tag or branch name');
    }

    tag = tag.toLocaleLowerCase();

    var variantId = await saveVariant(application.id, tag)[0];
    try {
        var buildResult = await buildImage(application, tag);
        var pushResult = await push(tag, application, buildResult.host);

        var hasErrors = buildResult['errorDetail']

        await update({
            name: tag,
            application: application.id,
            buildState: DeployedState[DeployedState.Deployed],
            buildTime: Date.now()
        });

        return {
            build: buildResult.responses,
            push: pushResult
        }
    }
    catch (ex) {
        await update({
            name: tag,
            application: application.id,
            buildState: DeployedState[DeployedState.Failed],
            buildTime: Date.now()
        });
        throw new Error(`Failed to deploy variant: ${ex.message}`);
    }
}

// TODO: Why was this unused?
// function hasErrors(log: any[]) {
//     var foundErrors = log.some(entry => !!entry['errorDetail']);
//     return foundErrors;
// }

async function isTagDeployable(tag: string) {
    const variant = await getVariants.one(tag);
    if (!variant) return true;

    // If the variant is Failed or Deleted, we can deploy it.
    const isReplaceable = [DeployedState.Failed, DeployedState.Deleted]
        .some(state => DeployedState[state] === variant.buildState);
    return isReplaceable;
}