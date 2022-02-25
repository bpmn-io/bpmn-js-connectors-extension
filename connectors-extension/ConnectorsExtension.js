import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

const restImageSvg = `
<svg width="22" height="22" viewBox="0 0 27 22" xmlns="http://www.w3.org/2000/svg">
  <rect
     fill="#ffffff" stroke="#000000" stroke-width="1"
     id="REST_TASK_RECT"
     width="25"
     height="21"
     x="0.4"
     y="0.4"
     rx="5" />
  <path
     d="m 4.8866058,14.492357 h 1.9043037 v -4.202586 h 1.6088066 l 2.2982969,4.202586 h 2.15055 l -2.56096,-4.481666 c 1.28048,-0.4432502 2.134133,-1.4446502 2.134133,-3.0698702 0,-2.396794 -1.723723,-3.184781 -3.9563529,-3.184781 H 4.8866058 Z M 6.7909095,8.7794608 v -3.4967 h 1.4774766 c 1.477476,0 2.2818799,0.42683 2.2818799,1.65806 0,1.21481 -0.8044039,1.83864 -2.2818799,1.83864 z"
     id="REST_TASK_ICON" />
</svg>
`;

const restImagePaletteSvg = `
<svg width="28" height="44" viewBox="0 0 27 22" xmlns="http://www.w3.org/2000/svg">
  <rect
     fill="#ffffff" stroke="#000000" stroke-width="1"
     id="REST_TASK_RECT"
     width="25"
     height="21"
     x="0.4"
     y="0.4"
     rx="5" />
  <path
     d="m 4.8866058,14.492357 h 1.9043037 v -4.202586 h 1.6088066 l 2.2982969,4.202586 h 2.15055 l -2.56096,-4.481666 c 1.28048,-0.4432502 2.134133,-1.4446502 2.134133,-3.0698702 0,-2.396794 -1.723723,-3.184781 -3.9563529,-3.184781 H 4.8866058 Z M 6.7909095,8.7794608 v -3.4967 h 1.4774766 c 1.477476,0 2.2818799,0.42683 2.2818799,1.65806 0,1.21481 -0.8044039,1.83864 -2.2818799,1.83864 z"
     id="REST_TASK_ICON" />
</svg>
`;

const restImageUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(restImageSvg);
const restImagePaletteUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(restImagePaletteSvg);

const emailImageSvg = `
<svg width="22" height="22" viewBox="0 0 27 22" xmlns="http://www.w3.org/2000/svg">
  <rect
     fill="#ffffff" stroke="#000000" stroke-width="1"
     id="EMAIL_TASK_RECT"
     width="25"
     height="21"
     x="0.4"
     y="0.4"
     rx="5" />
<path
   d="m 5.3462639,14.492366 h 7.0426381 v -1.6088 H 7.2505669 V 9.7151961 h 4.2190161 v -1.6088 H 7.2505669 v -2.74154 H 12.224738 V 3.7560341 H 5.3462639 Z"
   id="EMAIL_TASK_ICON" />
</svg>
`;

const emailImagePaletteSvg = `
<svg width="28" height="44" viewBox="0 0 27 22" xmlns="http://www.w3.org/2000/svg">
  <rect
     fill="#ffffff" stroke="#000000" stroke-width="1"
     id="EMAIL_TASK_RECT"
     width="25"
     height="21"
     x="0.4"
     y="0.4"
     rx="5" />
  <path
     d="m 5.3462639,14.492366 h 7.0426381 v -1.6088 H 7.2505669 V 9.7151961 h 4.2190161 v -1.6088 H 7.2505669 v -2.74154 H 12.224738 V 3.7560341 H 5.3462639 Z"
     id="EMAIL_TASK_ICON" />
</svg>
`;

const emailImageUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(emailImageSvg);
const emailImagePaletteUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(emailImagePaletteSvg);


// workaround for
// https://github.com/camunda/camunda-bpmn-js/issues/87
const LOWER_PRIORITY = 499;

import EMAIL_TEMPLATES from './.camunda/element-templates/email-connector.json';
import REST_TEMPLATES from './.camunda/element-templates/rest-connector.json';


const TEMPLATES = [ ...EMAIL_TEMPLATES, ...REST_TEMPLATES ];


export default function ConnectorsExtension(
    injector, create, elementFactory,
    bpmnFactory, contextPad, palette,
    translate, elementTemplatesLoader,
    elementTemplateChooser, eventBus,
    elementTemplates) {

  this._create = create;
  this._elementFactory = elementFactory;
  this._bpmnFactory = bpmnFactory;
  this._contextPad = contextPad;
  this._translate = translate;
  this._elementTemplates = elementTemplates;
  this._elementTemplatesLoader = elementTemplatesLoader;

  this._autoPlace = injector.get('autoPlace', false);

  eventBus.on('elementTemplates.select', (event) => {

    const { element } = event;

    const templates = this._getMatchingTemplates(element);

    elementTemplateChooser.choose(element, templates).then(template => {
      updateTemplate(element, template, injector);
    }).catch(err => {
      if (err === 'user-canceled') {
        console.log('elementTemplate.select :: user canceled');
      }

      console.error('elementTemplate.select', err);
    });
  });

  contextPad.registerProvider(LOWER_PRIORITY, this);
  palette.registerProvider(LOWER_PRIORITY, this);
}

ConnectorsExtension.$inject = [
  'injector', 'create', 'elementFactory',
  'bpmnFactory', 'contextPad', 'palette',
  'translate', 'elementTemplatesLoader',
  'elementTemplateChooser', 'eventBus',
  'elementTemplates'
];

ConnectorsExtension.prototype.loadTemplates = function() {
  this._elementTemplatesLoader.setTemplates(TEMPLATES);
};

ConnectorsExtension.prototype._getMatchingTemplates = function(element) {
  return this._elementTemplates.getAll().filter(template => {
    return isAny(element, template.appliesTo);
  });
};

ConnectorsExtension.prototype._createRestElement = function() {

  const elementFactory = this._elementFactory;
  const bpmnFactory = this._bpmnFactory;

  const element = elementFactory.createShape({ type: 'bpmn:ServiceTask' });

  /**
   * On creation, scaffold the following moddle (XML representation):
   *
   * <bpmn:serviceTask zeebe:modelerTemplate="io.camunda.connectors.RestConnector-s1">
   *  <bpmn:extensionElements>
   *    <zeebe:taskDefinition type="http" />
   *    <zeebe:taskHeaders>
   *      <zeebe:header key="method" value="get" />
   *     </zeebe:taskHeaders>
   *   </bpmn:extensionElements>
   * </bpmn:serviceTask>
   */

  const businessObject = getBusinessObject(element);

  const taskDefinition = bpmnFactory.create('zeebe:TaskDefinition', {
    type: 'http'
  });

  const taskHeaders = bpmnFactory.create('zeebe:TaskHeaders', {
    values: [
      bpmnFactory.create('zeebe:Header', {
        key: 'method',
        value: 'get'
      })
    ]
  });

  const extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
    values: [
      taskDefinition,
      taskHeaders
    ]
  });

  businessObject.set('extensionElements', extensionElements);

  businessObject.set('zeebe:modelerTemplate', 'io.camunda.connectors.RestConnector-s1');

  return element;
};

ConnectorsExtension.prototype._createEmailElement = function() {

  const elementFactory = this._elementFactory;
  const bpmnFactory = this._bpmnFactory;

  const element = elementFactory.createShape({ type: 'bpmn:ServiceTask' });

  /**
   * On creation, scaffold the following moddle (XML representation):
   *
   * <bpmn:serviceTask id="Activity_0pge5go" name="Send Email">
   *   <bpmn:extensionElements>
   *     <zeebe:taskDefinition type="send-email" />
   *     <zeebe:ioMapping>
   *       <zeebe:input source="= 25" target="PORT" />
   *     </zeebe:ioMapping>
   *   </bpmn:extensionElements>
   * </bpmn:serviceTask>
   */

  const businessObject = getBusinessObject(element);

  const taskDefinition = bpmnFactory.create('zeebe:TaskDefinition', {
    type: 'send-email'
  });

  const ioMapping = bpmnFactory.create('zeebe:IoMapping', {
    inputParameters: [
      bpmnFactory.create('zeebe:Input', {
        source: '= 25',
        target: 'PORT'
      })
    ]
  });

  const extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
    values: [
      taskDefinition,
      ioMapping
    ]
  });

  businessObject.set('extensionElements', extensionElements);

  businessObject.set('zeebe:modelerTemplate', 'io.camunda.connectors.EmailConnector-s2');

  return element;
};


ConnectorsExtension.prototype.getPaletteEntries = function() {

  const createEntry = (options) => {

    const {
      title,
      imageUrl,
      createElement
    } = options;

    const createStart = (event) => {
      this._create.start(event, createElement());
    };

    return {
      group: 'activity',
      imageUrl,
      title: this._translate(title),
      action: {
        dragstart: createStart,
        click: createStart
      }
    };
  };

  return {
    'create.rest-task': createEntry({
      imageUrl: restImagePaletteUrl,
      title: 'Create REST Task',
      createElement: () => this._createRestElement()
    }),
    'create.email-task': createEntry({
      imageUrl: emailImagePaletteUrl,
      title: 'Create mail Task',
      createElement: () => this._createEmailElement()
    })
  };
};

ConnectorsExtension.prototype.getContextPadEntries = function() {

  return (entries) => {

    // only allow when appending task is allowed, too
    if (!entries['append.append-task']) {
      return entries;
    }

    const appendEntry = (options) => {

      const {
        title,
        imageUrl,
        createElement
      } = options;

      const createStart = (event, shape) => {
        this._create.start(event, createElement(), {
          source: shape
        });
      };

      const autoPlace = this._autoPlace
        ? (event, shape) => {
          this._autoPlace.append(shape, createElement());
        }
        : createStart;

      return {
        group: 'model',
        title: this._translate(title),
        imageUrl,
        action: {
          dragstart: createStart,
          click: autoPlace
        }
      };
    };

    return {
      ...entries,
      'append.append-rest-task': appendEntry({
        title: 'Append REST Task',
        imageUrl: restImageUrl,
        createElement: () => this._createRestElement()
      }),
      'append.append-email-task': appendEntry({
        title: 'Append Email Task',
        imageUrl: emailImageUrl,
        createElement: () => this._createEmailElement()
      })
    };
  };
};



// helpers ////////////////

function updateTemplate(element, newTemplate, injector) {
  const commandStack = injector.get('commandStack'),
        elementTemplates = injector.get('elementTemplates');

  const oldTemplate = elementTemplates.get(element);

  commandStack.execute('propertiesPanel.zeebe.changeTemplate', {
    element: element,
    newTemplate,
    oldTemplate
  });
}