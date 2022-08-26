/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import ConnectorsExtension from './ConnectorsExtension';
import ConnectorKeyboardBindings from './ConnectorKeyboardBindings';

import ChangeMenuModule from './change-menu';
import ElementTemplateChooserModule from './element-template-chooser';
import ReplaceMenuModule from './replace-menu';
import AppendMenuModule from './append-menu';
import CreateMenuModule from './create-menu';

export default {
  __depends__: [
    ChangeMenuModule,
    ElementTemplateChooserModule,
    ReplaceMenuModule,
    AppendMenuModule,
    CreateMenuModule
  ],
  __init__: [
    'connectorsExtension',
    'connectorsKeyboardBindings'
  ],
  connectorsExtension: [ 'type', ConnectorsExtension ],
  connectorsKeyboardBindings: [ 'type', ConnectorKeyboardBindings ]
};
