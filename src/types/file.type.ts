export type FileType = Partial<Express.Multer.File> & {
  type: string,
  subtype: string,
  extension: string,
}