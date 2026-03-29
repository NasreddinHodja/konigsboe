export type HtmlSegment = { type: 'html'; content: string }
export type FigureSegment = { type: 'figure'; src: string; caption?: string; figNum?: number; id?: string }
export type VideoSegment = { type: 'video'; src: string; caption?: string; figNum?: number; id?: string }
export type EquationSegment = { type: 'equation'; latex: string; caption?: string; figNum?: number; id?: string }
export type TikzSegment = { type: 'tikz'; svg: string; caption?: string; figNum?: number; id?: string }
export type ObservationSegment = { type: 'observation'; content: string }
export type Segment = HtmlSegment | FigureSegment | VideoSegment | EquationSegment | TikzSegment | ObservationSegment
