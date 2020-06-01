import {
    combineReducers,
    createStore,
    applyMiddleware, ThunkAction, Action,
} from '@reduxjs/toolkit';
import user from './user';
import virtualMachine from './virtual-machine';
import mountedBackups from './mounted-backups';
import modal from './modal';
import thunk from 'redux-thunk';

export const rootReducer = combineReducers({
    user,
    virtualMachine,
    mountedBackups,
    modal
});

export const store = createStore(rootReducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
    RootState,
    unknown,
    Action<string>>;
