import { Container } from '~shared/ui/container';
import { CustomizationAddForm } from '~widgets/customization-add-form/ui/customization-add-form';

export const AddCustomization = () => (
  <Container className="mt-8 flex-1" slim>
    <CustomizationAddForm />
  </Container>
);
