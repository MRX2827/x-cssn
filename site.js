const repo = 'MRX2827/session-android';

async function refreshDownload() {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=30`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return;
    const releases = await response.json();
    const latest = releases
      .map(release => ({ release, version: Number(/^xsession-build-([1-9][0-9]*)$/.exec(release.tag_name)?.[1]) }))
      .filter(({ release, version }) => !release.draft && Number.isSafeInteger(version))
      .sort((a, b) => b.version - a.version)
      .find(({ release }) => release.assets.some(asset => asset.name === 'Xsession.apk' &&
        asset.browser_download_url === `https://github.com/${repo}/releases/download/${release.tag_name}/Xsession.apk`));
    if (!latest) return;
    const tag = latest.release.tag_name;
    document.querySelectorAll('[data-download]').forEach(link => {
      link.href = `https://github.com/${repo}/releases/download/${tag}/Xsession.apk`;
    });
    document.querySelector('[data-release]').href = `https://github.com/${repo}/releases/tag/${tag}`;
    document.querySelector('[data-version]').textContent =
      `Android 8.0+ · Сборка ${latest.version}${latest.release.prerelease ? ' · Предрелиз' : ''}`;
  } catch {
    // The static release links also work when the GitHub API is unavailable.
  }
}

const sheet = document.querySelector('#edit-demo');
const input = document.querySelector('#demo-input');
const message = document.querySelector('#demo-message');
const edited = document.querySelector('#demo-edited');
const openButton = document.querySelector('#demo-open');
const saveButton = document.querySelector('#demo-save');
const closeButton = document.querySelector('#demo-close');

function closeSheet() {
  openButton.focus({ preventScroll: true });
  sheet.inert = true;
  sheet.classList.remove('open');
  openButton.setAttribute('aria-expanded', 'false');
}
function saveEdit() {
  const text = input.value.trim();
  if (!text) return;
  if (message.textContent !== text) {
    message.textContent = text;
    edited.hidden = false;
    const bubble = message.parentElement;
    bubble.classList.remove('edit-pulse');
    requestAnimationFrame(() => bubble.classList.add('edit-pulse'));
  }
  closeSheet();
}
openButton.addEventListener('click', () => {
  input.value = edited.hidden ? 'Да, в 19:00!' : message.textContent;
  sheet.inert = false;
  sheet.classList.add('open');
  openButton.setAttribute('aria-expanded', 'true');
  input.focus({ preventScroll: true });
});
closeButton.addEventListener('click', closeSheet);
saveButton.addEventListener('click', saveEdit);
sheet.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeSheet();
  if (event.key === 'Enter' && event.target === input) saveEdit();
});
refreshDownload();
