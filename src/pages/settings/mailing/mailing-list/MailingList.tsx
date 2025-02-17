import React, {useEffect} from 'react';
import {Field, Form, Formik} from 'formik';
import {getMailingList, save} from 'store/mailing/actions';
import {useDispatch, useSelector} from 'react-redux';
import {selectMailing} from 'store/mailing/selectors';
import Text from 'components/input/reactive/Text';
import { useParams } from 'react-router-dom';
import {BackButton} from 'utils/backButton';
import {Button} from 'primereact/button';
import {Panel} from 'primereact/panel';
import InputChips from 'components/input/reactive/InputChips';
import {MailingListModel} from 'model/mailing/mailing';

const MailingList = () => {
    const dispatch = useDispatch();
    const { guid } = useParams();

    const model = guid === 'create' ? new MailingListModel() :  useSelector(selectMailing);

    useEffect(() => {
        dispatch(getMailingList(guid));
    }, [guid]);

    return (
        <div className="form">
            <Formik
                enableReinitialize
                initialValues={model}
                onSubmit={async (values) => {
                    await save(values);
                    history.back();
                }}
            >
                {() => (
                    <Form>
                        <Panel header="Mailing List">
                            <Field name="name" component={Text} label="Name" />
                            <Field
                                name="recipients"
                                component={InputChips}
                                label="Add recipient"
                            />
                        </Panel>
                        <div className="d-flex justify-content-between mt-3">
                            <div>
                                <BackButton />
                            </div>
                            <div>
                                <Button
                                    type="submit"
                                    label="Save"
                                    className="p-button-success"
                                />
                            </div>
                        </div>
                    </Form>
                    )}
            </Formik>
        </div>
    )
}

export default MailingList;
