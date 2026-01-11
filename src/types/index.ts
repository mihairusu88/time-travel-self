export interface Prop {
  id: string
  name: string
  image: string
  positions: string[]
}

export interface PropCategory {
  id: string
  name: string
  iconName: string
  props: Prop[]
}

export interface SelectedProp {
  id: string
  name: string
  image: string
  position: 'head' | 'leftHand' | 'rightHand' | 'body' | 'leftLeg' | 'rightLeg'
}

export interface Template {
  id: string
  name: string
  image: string
}

export interface TemplateCategory {
  id: string
  name: string
  templates: Template[]
}
