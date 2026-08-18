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
      titleTooltip: false,
      titleColor: '#000000',
      subTitleColor: '#000000',
    },
    avatar:{
      width: '40px',
      height: '40px',
      backgroundColor: 'transparent',
      borderWidth: '0px',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderRadius: '0px',
      padding: '0px',
      objectFit: 'cover',
      boxShadow: 'none',
    }
  }
