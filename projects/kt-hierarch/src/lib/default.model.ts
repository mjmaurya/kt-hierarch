export class NodeModel{
    title:string | undefined;
    subTitle:string | undefined;
    image:string | undefined;
    customContent:string | undefined;
    childs:Array<NodeModel> = [];
}

export const configData = {
    orientation: 'vertical',
    connector:{
        borderWidth:'1px',
        borderStyle: 'solid',
        borderColor: '#d2d1d1',
      },
    node:{
      backgroundColor: '#ffffff',
      borderWidth:'1px',
      borderStyle: 'solid',
      borderColor: '#E8E8E8',
    }
  }