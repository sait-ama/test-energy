import { PropsWithChildren } from 'react';

import { useChannelStateContext } from '../../../context/channel-state-context';
import { useMessageInputContext } from '../../../context/message-input-context';
import { ImageDropzone } from '../react-file-utilities';
import { type MessageInputProps, MessageInputProvider } from './message-input';

const DropzoneInner = ({ children }: PropsWithChildren) => {
  const { acceptedFiles, multipleUploads } = useChannelStateContext('DropzoneProvider');

  const { isUploadEnabled, maxFilesLeft, uploadNewFiles } =
    useMessageInputContext('DropzoneProvider');

  return (
    <ImageDropzone
      accept={acceptedFiles}
      disabled={!isUploadEnabled || maxFilesLeft === 0}
      handleFiles={uploadNewFiles}
      maxNumberOfFiles={maxFilesLeft}
      multiple={multipleUploads}
    >
      {children}
    </ImageDropzone>
  );
};

export const DropzoneProvider = (props: PropsWithChildren<MessageInputProps>) => {
  return (
    <MessageInputProvider isUploadEnabled>
      <DropzoneInner>{props.children}</DropzoneInner>
    </MessageInputProvider>
  );
};
