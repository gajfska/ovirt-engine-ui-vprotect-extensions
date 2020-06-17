import { RootState } from '../index';

export const selectModal = (store: RootState) => store.modal.modal;
export const selectProps = (store: RootState) => store.modal.props;
export const selectShow = (store: RootState) => store.modal.show;
export const selectSaved = (store: RootState) => store.modal.saved;
