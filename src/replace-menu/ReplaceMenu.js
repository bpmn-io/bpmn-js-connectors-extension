import {
  html
} from 'htm/preact';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect
} from 'preact/hooks';

import {
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import {
  scrollIntoView,
  sanitizeImageUrl
} from '../utils';

import {
  ChangeMenuResult
} from '../common';

import clsx from 'clsx';


const REPLACE_MENU_PROVIDER = 'bpmn-replace';


export default function ReplaceMenu(elementTemplates, popupMenu, changeMenu) {
  this._elementTemplates = elementTemplates;
  this._popupMenu = popupMenu;
  this._changeMenu = changeMenu;
}

ReplaceMenu.$inject = [
  'elementTemplates',
  'popupMenu',
  'changeMenu'
];

ReplaceMenu.prototype._getMatchingTemplates = function(element) {
  return this._elementTemplates.getAll().filter(template => {
    return isAny(element, template.appliesTo);
  });
};

ReplaceMenu.prototype._applyTemplate = function(element, newTemplate) {
  this._elementTemplates.applyTemplate(element, newTemplate);
};

ReplaceMenu.prototype._getTemplateEntries = function(element) {

  const templates = this._getMatchingTemplates(element);

  return templates.map(template => {

    const {
      id,
      name,
      description,
      category = {
        id: 'templates',
        name: 'Templates'
      },
      icon = {},
      search,
      documentationRef
    } = template;

    return {
      name,
      description,
      id: `replace.template-${id}`,
      category,
      imageUrl: sanitizeImageUrl(icon.contents),
      search,
      documentationRef,
      action: () => {
        this._applyTemplate(element, template);
      }
    };
  });
};

ReplaceMenu.prototype._getContext = function(element) {

  const providers = this._popupMenu._getProviders(REPLACE_MENU_PROVIDER);

  const entries = this._popupMenu._getEntries(element, providers);
  const headerEntries = this._popupMenu._getHeaderEntries(element, providers);

  const templateEntries = this._getTemplateEntries(element);

  return {
    entries: [
      ...Object.entries(entries).map(
        ([key, value]) => ({ id: key, ...value })
      ),
      ...templateEntries
    ],
    headerEntries,
    empty: !(
      Object.keys(entries).length ||
      Object.keys(headerEntries).length ||
      templateEntries.length
    )
  };
};

ReplaceMenu.prototype.open = function(element, position) {

  const renderFn = (onClose) => {
    const {
      entries,
      headerEntries
    } = this._getContext(element);

    return html`
      <${ReplaceMenuComponent}
        entries=${ entries }
        headerEntries=${ headerEntries }
        onClose=${ onClose }
      />
    `;
  };

  return this._changeMenu.open(renderFn, {
    className: 'cmd-replace-menu',
    element,
    position
  }).catch((error) => {
    if (error !== 'user-canceled') {
      console.error('replaceMenu.open :: error', error);
    }
  });
};

ReplaceMenu.prototype.isEmpty = function(element) {
  return this._getContext(element).empty;
};


/**
 * A preact component that renders the replace menu.
 *
 * @param {any} props
 */
function ReplaceMenuComponent(props) {

  const {
    onClose
  } = props;

  const onSelect = (event, entry, shouldClose=true) => {
    entry.action(event, entry);

    shouldClose && onClose();
  };

  const inputRef = useRef();
  const resultsRef = useRef();

  const [ value, setValue ] = useState('');

  const [ templates, setTemplates ] = useState(props.entries);
  const [ selectedTemplate, setSelectedTemplate ] = useState(templates[0]);

  useEffect(() => {

    const filter = (template) => {
      if (!value) {
        return true;
      }

      const search = [
        template.name && 'connector' || '',
        template.name,
        template.description || '',
        template.label || '',
        template.search || ''
      ].join('---').toLowerCase();

      return value.toLowerCase().split(/\s/g).every(
        term => search.includes(term)
      );
    };

    const templates = props.entries.filter(filter);

    if (!templates.includes(selectedTemplate)) {
      setSelectedTemplate(templates[0]);
    }

    setTemplates(templates);
  }, [ value, selectedTemplate, props.templates ]);


  // focus input on initial mount
  useLayoutEffect(() => {
    inputRef.current.focus();
  }, []);

  // scroll to keyboard selected result
  useLayoutEffect(() => {

    const containerEl = resultsRef.current;

    const selectedEl = containerEl.querySelector('.selected');

    if (selectedEl) {
      scrollIntoView(selectedEl);
    }
  }, [ selectedTemplate ]);

  const keyboardSelect = useCallback(direction => {

    const idx = templates.indexOf(selectedTemplate);

    let nextIdx = idx + direction;

    if (nextIdx < 0) {
      nextIdx = templates.length - 1;
    }

    if (nextIdx >= templates.length) {
      nextIdx = 0;
    }

    setSelectedTemplate(templates[nextIdx]);
  }, [ templates, selectedTemplate ]);

  const handleKeyDown = useCallback(event => {

    if (event.key === 'Enter' && selectedTemplate) {
      return onSelect(event, selectedTemplate);
    }

    if (event.key === 'Escape') {
      return onClose();
    }

    // ARROW_UP or SHIFT + TAB navigation
    if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      keyboardSelect(-1);

      return event.preventDefault();
    }

    // ARROW_DOWN or TAB navigation
    if (event.key === 'ArrowDown' || event.key === 'Tab') {
      keyboardSelect(1);

      return event.preventDefault();
    }

  }, [ selectedTemplate, keyboardSelect ]);

  const handleKey = useCallback((event) => {
    setValue(() => event.target.value);
  }, []);

  return html`
  <div class="cmd-change-menu__header">
    <h3 class="cmd-change-menu__title">
      Change element
    </h3>
    ${ Object.entries(props.headerEntries).map(([key, value]) => html`
      <span
        class=${ clsx('cmd-change-menu__header-entry', value.className, { active: value.active }) }
        onClick=${ (event) => onSelect(event, value, false) }
        title=${ `Toggle ${ value.title }` }
      ></span>
    `) }
  </div>

  <div class="cmd-change-menu__body">
    <div class=${ clsx('cmd-change-menu__search', { hidden: props.entries.length < 5 }) }>
      <svg class="cmd-change-menu__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
      </svg>

      <input
        ref=${ inputRef }
        type="text"
        onKeyup=${ handleKey }
        onKeydown=${ handleKeyDown }
      />
    </div>

    <ul class="cmd-change-menu__results" ref=${ resultsRef }>
      ${ templates.map((template, idx) => html`

        <${ChangeMenuResult}
          key=${ template.id }
          template=${ template }
          lastTemplate=${ templates[idx - 1] }
          selected=${ template === selectedTemplate }
          onMouseEnter=${ () => setSelectedTemplate(template) }
          onClick=${ (event) => onSelect(event, template) }
        />
      `) }

      ${ !templates.length && html`
        <li class="cmd-change-menu__muted-entry">Nothing found</li>
      `}
    </ul>
  </div>
  `;
}