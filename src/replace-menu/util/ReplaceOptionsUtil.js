import * as replaceOptions from 'bpmn-js/lib/features/replace/ReplaceOptions';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { isEventSubProcess, isExpanded } from 'bpmn-js/lib/util/DiUtil';


export function getOptionsForElement(element) {
  var businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:DataObjectReference')) {
    return replaceOptions.DATA_OBJECT_REFERENCE;
  }

  if (is(businessObject, 'bpmn:DataStoreReference') && !is(element.parent, 'bpmn:Collaboration')) {
    return replaceOptions.DATA_STORE_REFERENCE;
  }

  // start events outside sub processes
  if (is(businessObject, 'bpmn:StartEvent') && !is(businessObject.$parent, 'bpmn:SubProcess')) {
    return replaceOptions.START_EVENT;
  }

  // expanded/collapsed pools
  if (is(businessObject, 'bpmn:Participant')) {
    return replaceOptions.PARTICIPANT;
  }

  // start events inside event sub processes
  if (is(businessObject, 'bpmn:StartEvent') && isEventSubProcess(businessObject.$parent)) {
    return replaceOptions.EVENT_SUB_PROCESS_START_EVENT;
  }

  // start events inside sub processes
  if (is(businessObject, 'bpmn:StartEvent') && !isEventSubProcess(businessObject.$parent)
    && is(businessObject.$parent, 'bpmn:SubProcess')) {
    return replaceOptions.START_EVENT_SUB_PROCESS;
  }

  // end events
  if (is(businessObject, 'bpmn:EndEvent')) {
    return replaceOptions.END_EVENT;
  }

  // boundary events
  if (is(businessObject, 'bpmn:BoundaryEvent')) {
    return replaceOptions.BOUNDARY_EVENT;
  }

  // intermediate events
  if (is(businessObject, 'bpmn:IntermediateCatchEvent') ||
    is(businessObject, 'bpmn:IntermediateThrowEvent')) {
    return replaceOptions.INTERMEDIATE_EVENT;
  }

  // gateways
  if (is(businessObject, 'bpmn:Gateway')) {
    return replaceOptions.GATEWAY;
  }

  // transactions
  if (is(businessObject, 'bpmn:Transaction')) {
    return replaceOptions.TRANSACTION;
  }

  // expanded event sub processes
  if (isEventSubProcess(businessObject) && isExpanded(element)) {
    return replaceOptions.EVENT_SUB_PROCESS;
  }

  // expanded sub processes
  if (is(businessObject, 'bpmn:SubProcess') && isExpanded(element)) {
    return replaceOptions.SUBPROCESS_EXPANDED;
  }


  // sequence flows
  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return replaceOptions.SEQUENCE_FLOW;
  }

  // flow nodes
  if (is(businessObject, 'bpmn:FlowNode')) {
    return replaceOptions.TASK;
  }

  return [];
}