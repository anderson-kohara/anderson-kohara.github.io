const publications = window.PUBLICATIONS || [];
const searchInput = document.querySelector('#publication-search');
const yearSelect = document.querySelector('#publication-year');
const publicationList = document.querySelector('#publication-list');
const publicationCount = document.querySelector('#publication-count');
const emptyMessage = document.querySelector('#publication-empty');
const t = window.siteI18n?.t || (text => text);

function readableTitle(title) {
  return title
    .replace(/\\sqrt\{s\}/g, '√s')
    .replace(/\\rm\{([^}]+)\}/g, '$1')
    .replace(/\\rm\s+/g, '')
    .replace(/p\s*\\(?:bar|overline)\s*\{?p\}?/g, 'p p̄')
    .replace(/p\\=p/g, 'p p̄')
    .replace(/\\[()]/g, '')
    .replace(/\$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeLink(label, href) {
  const link = document.createElement('a');
  link.textContent = label;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function makePublication(publication) {
  const item = document.createElement('li');
  item.className = 'publication-item';

  const side = document.createElement('div');
  side.className = 'publication-side';
  const year = document.createElement('span');
  year.className = 'publication-year';
  year.textContent = publication.year;
  const type = document.createElement('span');
  type.className = 'publication-type';
  type.textContent = t(publication.type === 'conference paper' ? 'Conference paper' : publication.journal ? 'Article' : 'Preprint');
  side.append(year, type);

  const body = document.createElement('div');
  body.className = 'publication-body';
  const title = document.createElement('h2');
  title.className = 'publication-title';
  const recordUrl = publication.id
    ? `https://inspirehep.net/literature/${publication.id}`
    : `https://doi.org/${publication.doi}`;
  title.append(makeLink(readableTitle(publication.title), recordUrl));
  const authors = document.createElement('p');
  authors.className = 'publication-authors';
  authors.textContent = publication.authors.join(', ');
  body.append(title, authors);

  if (publication.journal) {
    const journal = document.createElement('p');
    journal.className = 'publication-journal';
    journal.textContent = publication.journal;
    body.append(journal);
  }

  const links = document.createElement('div');
  links.className = 'publication-links';
  if (publication.id) links.append(makeLink(t('INSPIRE record ↗'), recordUrl));
  if (publication.doi) links.append(makeLink(t('DOI ↗'), `https://doi.org/${publication.doi}`));
  if (publication.arxiv) links.append(makeLink(t('arXiv ↗'), `https://arxiv.org/abs/${publication.arxiv}`));
  if (publication.id) links.append(makeLink(t('BibTeX ↗'), `https://inspirehep.net/api/literature/${publication.id}?format=bibtex`));
  body.append(links);

  item.append(side, body);
  return item;
}

if (publicationList && searchInput && yearSelect) {
  const years = [...new Set(publications.map(publication => publication.year))].sort((a, b) => b - a);
  for (const year of years) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.append(option);
  }

  function render() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const selectedYear = yearSelect.value;
    const filtered = publications.filter(publication => {
      const matchesYear = selectedYear === 'all' || publication.year === Number(selectedYear);
      const searchable = [publication.title, publication.authors.join(' '), publication.journal, publication.doi, publication.arxiv].join(' ').toLocaleLowerCase();
      return matchesYear && searchable.includes(query);
    });

    publicationList.replaceChildren(...filtered.map(makePublication));
    publicationCount.textContent = window.siteI18n?.publicationCount(filtered.length, publications.length) || `Showing ${filtered.length} of ${publications.length} publications`;
    emptyMessage.hidden = filtered.length !== 0;
  }

  searchInput.addEventListener('input', render);
  yearSelect.addEventListener('change', render);
  render();
}
