const oneDriveTokens = require('./oneDriveTokens');
const albumViewTokens = require('./albumViewTokens');
const oneDriveGraph = require('./oneDriveGraph');

const getOneDriveFolders = async (req, res) => {
  try {
    console.log('getOneDriveFolders id: ', req.params.id);
    const accessToken = await oneDriveTokens.getOneDriveAccessToken(req.user.userId);
    if (!accessToken) {
      // if there's a problem, expire the cookie
      console.log('invalid accessToken in getOneDriveFolders, removing cookie');
      await albumViewTokens.setSessionJwt(req, res);
      res.json({ emptyResponse: true });
      return;
    }
    const children = await oneDriveGraph.getChildren(
      accessToken,
      req.params.id
    );

    if (children) {
      //console.log('children: ', JSON.stringify(children));
      res.json(children.value);
    } else {
      console.log('children is empty');
      res.json({ emptyResponse: true });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: err });
  }
};

const getOneDriveFile = async (req, res) => {
  try {
    console.log('getOneDriveFile id: ', req.params.id);
    const accessToken = oneDriveTokens.getOneDriveAccessToken(req.user.userId);
    if (!accessToken) {
      // if there's a problem, expire the cookie
      console.log('invalid accessToken in getOneDriveFile, removing cookie');
      await albumViewTokens.setSessionJwt(req, res);
      res.json({ emptyResponse: true });
      return;
    }
    const file = await oneDriveGraph.getFile(accessToken, req.params.id);

    if (file) {
      //console.log('file: ', JSON.stringify(file));
      res.json(file.value);
    } else {
      console.log('file is empty');
      res.json({ emptyResponse: true });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: err });
  }
};

module.exports = {
  getOneDriveFolders,
  getOneDriveFile,
};
