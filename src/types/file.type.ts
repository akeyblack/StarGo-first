export type FileType = Partial<Express.Multer.File> & {
  type: string,
  extension: string,
}