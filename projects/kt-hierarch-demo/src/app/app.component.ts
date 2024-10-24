import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'kt-hierarch-demo';

  config = {
    orientation: 'vertical',
    connector:{
      borderWidth:'2px',
      borderColor: '#ff0000',
    },
    node:{
      titleTooltip: true,
      borderWidth:'2px',
      borderStyle: 'dashed',
      borderColor: '#ff0000',
    }
  }
 data = {
      "title": "John Smith",
      "subTitle": "CEO",
      "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
      "childs": [
        {
          "title": "Jane Doe",
          "subTitle": "CFO",
          "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
          "childs": [
            {
              "title": "Alice Johnson",
              "subTitle": "Finance Manager",
              "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
              "childs": [
                {
                  "title": "Tom Brown",
                  "subTitle": "Accountant",
                  "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
                  "childs": []
                },
                {
                  "title": "Lisa White",
                  "subTitle": "Accountant",
                  "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
                  "childs": []
                }
              ]
            }
          ]
        },
        {
          "title": "Mike Green",
          "subTitle": "CTO",
          "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
          "childs": [
            {
              "title": "Sarah Black",
              "subTitle": "Development Manager",
              "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
              "childs": [
                {
                  "title": "Chris Blue",
                  "subTitle": "Developer",
                  "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
                  "childs": []
                },
                {
                  "title": "Emma Grey",
                  "subTitle": "Developer",
                  "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
                  "childs": []
                }
              ]
            }
          ]
        },
        {
          "title": "Rachel Red",
          "subTitle": "CMO",
          "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
          "childs": [
            {
              "title": "David Yellow",
              "subTitle": "Marketing Manager",
              "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
              "childs": [
                {
                  "title": "Karen Violet",
                  "subTitle": "Marketing Specialist",
                  "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
                  "childs": []
                },
                {
                  "title": "Paul Orange",
                  "subTitle": "Marketing Specialist",
                  "image": "https://cdn-icons-png.flaticon.com/512/8847/8847137.png",
                  "childs": []
                }
              ]
            }
          ]
        }
      ]
    }
  
  rootNode = {
    subTitle: 'CEO',
    title: 'Chief Executive Officer from manoj kumar',
    childs: [
      {
        subTitle: 'Manager',
        title: 'Sales Manager',
        image: 'https://cdn-icons-png.flaticon.com/512/8847/8847137.png',
        childs: []
      },
      {
        title: 'CTO',
        subTitle: 'Chief Technology Officer',
        image: 'https://cdn-icons-png.flaticon.com/512/8847/8847137.png',
        childs: []
      }
    ]
  }
}
