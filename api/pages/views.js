const { getPagePreviewData } = require('../../services/getPagePreviewData');

exports.previewPage = async (req, res, next) => {
  const url = req.body.url;
  res.json(await getPagePreviewData(url))
}
