/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import nls = require('vs/nls');
import lifecycle = require('vs/base/common/lifecycle');
import dom = require('vs/base/browser/dom');
import actions = require('vs/base/common/actions');
import splitview = require('vs/base/browser/ui/splitview/splitview');
import debug = require('vs/workbench/parts/debug/common/debug');
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';

const $ = dom.emmet;

export class InformationView extends splitview.CollapsibleView {

	private static MEMENTO = 'informationview.memento';
	private bodyContainer: HTMLElement;
	private toDispose: lifecycle.IDisposable[];

	constructor(actionRunner: actions.IActionRunner, private settings: any,
		@ITelemetryService private telemetryService: ITelemetryService,
		@debug.IDebugService private debugService: debug.IDebugService
	) {
		super({
			minimumSize: 2 * 22,
			initialState: !!settings[InformationView.MEMENTO] ? splitview.CollapsibleState.COLLAPSED : splitview.CollapsibleState.EXPANDED,
			ariaHeaderLabel: nls.localize('information', "Information")
		});
		this.toDispose = [];
	}

	public renderHeader(container: HTMLElement): void {
		const titleDiv = dom.append(container, $('div.title'));
		const titleSpan = dom.append(titleDiv, $('span.label'));
		titleSpan.textContent = nls.localize('information', "Information");
	}

	public renderBody(container: HTMLElement): void {
		dom.addClass(container, 'mock-information');
		this.bodyContainer = container;
		const viewModel = this.debugService.getViewModel();
		this.toDispose.push(viewModel.addListener2(debug.ViewModelEvents.FOCUSED_STACK_FRAME_UPDATED, () => this.onFocusedStackFrameUpdated()));
	}

	private onFocusedStackFrameUpdated(): void {
		const stackFrame = this.debugService.getViewModel().getFocusedStackFrame();
		this.bodyContainer.textContent = stackFrame ? stackFrame.name : '';
	}

	public shutdown(): void {
		this.settings[InformationView.MEMENTO] = (this.state === splitview.CollapsibleState.COLLAPSED);
	}

	public dispose(): void {
		this.toDispose = lifecycle.dispose(this.toDispose);
	}
}
