const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

exports.getPagePreviewData = async url => {
  const page = await axios.get(url);
  const { document } = (new JSDOM(page.data)).window;
  return {
    url: await getDomainName(document, url),
    title: await getTitle(document),
    description: await getDescription(document),
    image: await getImg(document, url)
  };
}

const getTitle = async page => {
  const ogTitle = page.querySelector('meta[property="og:title"]');
  if (ogTitle != null && ogTitle.content.length > 0) {
    return ogTitle.content;
  }
  const twitterTitle = page.querySelector('meta[name="twitter:title"]');
  if (twitterTitle != null && twitterTitle.content.length > 0) {
    return twitterTitle.content;
  }
  const docTitle = page.title;
  if (docTitle != null && docTitle.length > 0) {
    return docTitle;
  }
  const h1 = page.querySelector("h1").innerHTML;
  if (h1 != null && h1.length > 0) {
    return h1;
  }
  const h2 = page.querySelector("h2").innerHTML;
  if (h2 != null && h2.length > 0) {
    return h2;
  }
  return null;
};

const getDescription = async page => {
  const ogDescription = page.querySelector(
    'meta[property="og:description"]'
  );
  if (ogDescription != null && ogDescription.content.length > 0) {
    return ogDescription.content;
  }
  const twitterDescription = page.querySelector(
    'meta[name="twitter:description"]'
  );
  if (twitterDescription != null && twitterDescription.content.length > 0) {
    return twitterDescription.content;
  }
  const metaDescription = page.querySelector('meta[name="description"]');
  if (metaDescription != null && metaDescription.content.length > 0) {
    return metaDescription.content;
  }
  let paragraphs = page.querySelectorAll("p");
  let fstVisibleParagraph = null;
  for (let i = 0; i < paragraphs.length; i++) {
    if (
      // if object is visible in dom
      paragraphs[i].offsetParent !== null &&
      !paragraphs[i].childElementCount != 0
    ) {
      fstVisibleParagraph = paragraphs[i].textContent;
      break;
    }
  }
  return fstVisibleParagraph;
}

const getDomainName = async (page, url) => {
  const canonicalLink = page.querySelector("link[rel=canonical]");
  if (canonicalLink != null && canonicalLink.href.length > 0) {
    return canonicalLink.href;
  }

  const ogUrlMeta = page.querySelector('meta[property="og:url"]');
  if (ogUrlMeta != null && ogUrlMeta.content.length > 0) {
    return ogUrlMeta.content;
  }

  return url;
}

const urlImageIsAccessible = async url => {
  const image = await axios.get(url);
  const contentType = image.headers["content-type"];
  return new RegExp("image/*").test(contentType);
}

const getImg = async (page, url) => {
  const ogImg = page.querySelector('meta[property="og:image"]');
  if (
    ogImg != null &&
    ogImg.content.length > 0 &&
    (await urlImageIsAccessible(ogImg.content))
  ) {
    return ogImg.content;
  }
  const imgRelLink = page.querySelector('link[rel="image_src"]');
  if (
    imgRelLink != null &&
    imgRelLink.href.length > 0 &&
    (await urlImageIsAccessible(imgRelLink.href))
  ) {
    return imgRelLink.href;
  }
  const twitterImg = page.querySelector('meta[name="twitter:image"]');
  if (
    twitterImg != null &&
    twitterImg.content.length > 0 &&
    (await urlImageIsAccessible(twitterImg.content))
  ) {
    return twitterImg.content;
  }

  let imgs = Array.from(page.getElementsByTagName("img"));
  if (imgs.length > 0) {
    imgs = imgs.filter(img => {
      let addImg = true;
      if (img.naturalWidth > img.naturalHeight) {
        if (img.naturalWidth / img.naturalHeight > 3) {
          addImg = false;
        }
      } else {
        if (img.naturalHeight / img.naturalWidth > 3) {
          addImg = false;
        }
      }
      if (img.naturalHeight <= 50 || img.naturalWidth <= 50) {
        addImg = false;
      }
      return addImg;
    });
    imgs.forEach(img =>
      img.src.indexOf("//") === -1
        ? (img.src = `${new URL(url).origin}/${img.src}`)
        : img.src
    );
    return imgs[0].src;
  }
  return null;
}

