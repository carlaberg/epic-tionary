type DrawMeta = {
  x: number;
  y: number;
};

export class Painter {
  private context: CanvasRenderingContext2D;

  constructor(context?: CanvasRenderingContext2D) {
    if (context) {
      this.context = context;
    }
  }
  public startDrawing(draw: DrawMeta): void {
    this._getContext().beginPath();
    this._getContext().moveTo(draw.x, draw.y);
  }

  public draw(draw: DrawMeta): void {
    this._getContext().lineTo(draw.x, draw.y);
    this._getContext().stroke();
  }

  public stopDrawing(): void {
    this._getContext().closePath();
  }

  public clearCanvas(): void {
    this._getContext().clearRect(
      0,
      0,
      this._getContext().canvas.width,
      this._getContext().canvas.height
    );
  }

  public setContext(context: CanvasRenderingContext2D): void {
    this.context = context;
  }

  private _getContext(): CanvasRenderingContext2D {
    if (!this.context) {
      throw new Error("Context not set");
    }
    return this.context;
  }
}
