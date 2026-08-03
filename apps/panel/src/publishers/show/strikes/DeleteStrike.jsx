import { DeleteWithConfirmButton, TextInput, useRecordContext } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';

export const DeleteStrike = () => {
    const form = useForm();
    const record = useRecordContext();
    const { watch, control } = form;

    return (
        <FormProvider {...form}>
            <DeleteWithConfirmButton
                disabled={!record.is_active}
                redirect={false}
                label="Снять"
                confirmTitle="Снять страйк"
                confirmContent={
                    <div>
                        <TextInput source="" control={control} label="Причина снятия" fullWidth name="moderator_msg" />
                    </div>
                }
                mutationOptions={{
                    meta: { data: watch() },
                }}
            />
        </FormProvider>
    );
};
