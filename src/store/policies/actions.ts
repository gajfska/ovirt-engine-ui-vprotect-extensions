import {PoliciesAction, SET_FILTERED_POLICIES, SET_POLICIES} from './types';
import {Dispatch} from 'redux';
import {alertService} from '../../components/vprotect/services/alert-service';
import {policiesService} from '../../components/vprotect/services/policies-service';
import {SnapshotTask} from '../../components/vprotect/model/tasks/snapshot-task';

export const setPolicies = (payload: any[]): PoliciesAction => {
    return {
        type: SET_POLICIES,
        payload
    };
};

export const setFilteredPolicies = (payload: any[]): PoliciesAction => {
    return {
        type: SET_FILTERED_POLICIES,
        payload
    };
};

export const getPolicies = (type: string) => async (dispatch: Dispatch) => {
    const policies = await policiesService.getPolicies(type)
    await dispatch(setPolicies(policies))
}

export const removePolicy = (type: string, guid: string) => async (dispatch: Dispatch) => {
    await policiesService.deletePolicy(type, guid)
    alertService.info('Policy removed')
    const policies = await policiesService.getPolicies(type)
    await dispatch(setPolicies(policies))
}

export const snapshotPolicy = (type: string, policyListElement: any) => async (dispatch: Dispatch) => {
    const policy = await policiesService.getPolicy(type, policyListElement.guid)
    const task = new SnapshotTask()
    task.protectedEntities = policy.vms
    task.rule = policy.rules[0]
    await policiesService.submitTaskSnapshot(task)
    alertService.info('Snapshot task has been submitted')
}
