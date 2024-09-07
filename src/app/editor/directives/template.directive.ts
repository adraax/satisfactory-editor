import { Directive, inject, TemplateRef } from "@angular/core";

@Directive({ selector: "ng-template[nodeHtml]" })
export class NodeHtmlTemplateDirective {
  public templateRef = inject(TemplateRef);
}

@Directive({ selector: "ng-template[groupNode]" })
export class GroupNodeTemplateDirective {
  public templateRef = inject(TemplateRef);
}
