'use client';

import { PostFormCreateRootProvider, PostFormEditRootProvider } from '../../model/store';
import { FormAuthorField } from './form-parts/author-field';
import { FormEditorField } from './form-parts/editor-field';
import { FormMainImageField } from './form-parts/main-image-field';
import { FormRelatedField } from './form-parts/related-field';
import { FormRoot } from './form-parts/root';
import { FormSubmitButton } from './form-parts/submit-button';
import { FormTagsField } from './form-parts/tags-field';

export const PostFormProvider = {
  Edit: PostFormEditRootProvider,
  Create: PostFormCreateRootProvider,
};

export const PostForm = {
  Root: FormRoot,
  AuthorField: FormAuthorField,
  TagsField: FormTagsField,
  EditorField: FormEditorField,
  RelatedField: FormRelatedField,
  MainImageField: FormMainImageField,
  SubmitButton: FormSubmitButton,
};
