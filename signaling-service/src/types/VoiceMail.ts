export type TVoiceMail = {
  sender: string;
  recipient: string;
  fileName: string;
  fileUrl: string;
  created_date?: Date;
  seen_at?: Date;
};

export type TVoiceMailPayloadToken = {
  sender: string;
  recipient: string;
};
