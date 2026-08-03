// 'use client';
//
// import { Input } from '~shared/ui/input';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useForm } from '~shared/ui/form';
// import { Button } from '@re/ui-kit/ui/button';
// import { UrlFormatter } from '~shared/utils/url-formatter';
// import { TextEditorContainer, TextEditorEditableArea, TextEditorRoot } from '~shared/ui/text-editor/text-editor';
// import { TextEditorMarkdownPlugin } from '~shared/ui/text-editor/plugins/markdown-plugin';
// import { TextEditorOnChangePlugin } from '~shared/ui/text-editor/plugins/on-change-plugin';
// import { TextEditorDefaultValuePlugin } from '~shared/ui/text-editor/plugins/default-value-plugin';
// import { CharacterFormSchema, CharacterFormValidator } from '~entities/character/model/validators';
// import React from 'react';
// import { importToastAsync } from '~shared/ui/toast/toast.async';
// import { useCreateCharacter, useUpdateCharacter } from '~entities/character/model/mutation';
// import { CharacterImage } from '~entities/character/ui/character-image';
// import {
//     ImageUploadEditorContent,
//     ImageUploadEditorCropper,
//     ImageUploadEditorRoot,
//     ImageUploadEditorTrigger,
//     ImageUploadEditorUploader,
// } from '~shared/ui/image-upload-editor';
// import { ImageContent, ImageFallback, ImageRoot } from '~shared/ui/image';
// import { Section } from '~shared/ui/section';
// import { SearchField } from '~shared/lib/search/search-field';
// import { SearchField as SearchFieldEnum } from '~shared/api/models/search';
// import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
// import { mergeFunc } from '~shared/utils/merge-funcs';
// import { preventDefault } from '~shared/utils/prevent-default';
// import { useFormContext } from 'react-hook-form';
// import { useParams } from 'next/navigation';
// import { useErrorHandler } from '~shared/lib/form/error-handling';
// import { useCharacterQuery } from '~entities/character/model/queries';
