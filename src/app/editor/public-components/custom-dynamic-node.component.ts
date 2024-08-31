import { Directive, Input, OnInit } from "@angular/core";
import { CustomNodeBaseComponent } from "../components/custom-node-base/custom-node-base.component";
import { ComponentDynamicNode } from "../interfaces/node.interface";

@Directive()
export abstract class CustomDynamicNodeComponent<T = unknown> extends CustomNodeBaseComponent<T> implements OnInit {
  @Input()
  public override node!: ComponentDynamicNode<T>;

  public override ngOnInit(): void {
    if (this.node.data) {
      this.data = this.node.data;
    }

    super.ngOnInit();
  }
}
