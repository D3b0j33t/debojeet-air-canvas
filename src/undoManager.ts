import { BalloonObject, Stroke } from "./types";
import { ObjectManager } from "./objectManager";
export interface UndoableAction {
  type: "create_balloon" | "remove_balloon" | "clear_all";
  execute(): Promise<void>;
  undo(): Promise<void>;
}

export class CreateBalloonAction implements UndoableAction {
  type: "create_balloon" = "create_balloon";
  private objectManager: ObjectManager;
  private stroke: Stroke;
  private createdObject: BalloonObject | null = null;

  constructor(objectManager: ObjectManager, stroke: Stroke) {
    this.objectManager = objectManager;
    this.stroke = stroke;
  }

  async execute(): Promise<void> {
    this.createdObject = await this.objectManager.createFromStroke(this.stroke);
  }

  async undo(): Promise<void> {
    if (this.createdObject) {
      await this.objectManager.removeObject(this.createdObject, true);
      this.createdObject = null;
    }
  }

  setCreatedObject(obj: BalloonObject): void {
    this.createdObject = obj;
  }
}

export class RemoveBalloonAction implements UndoableAction {
  type: "remove_balloon" = "remove_balloon";
  private objectManager: ObjectManager;
  private balloon: BalloonObject;
  private stroke: Stroke;

  constructor(objectManager: ObjectManager, balloon: BalloonObject) {
    this.objectManager = objectManager;
    this.balloon = balloon;
    this.stroke = balloon.originalStroke;
  }

  async execute(): Promise<void> {
    await this.objectManager.removeObject(this.balloon);
  }

  async undo(): Promise<void> {
    this.balloon = await this.objectManager.createFromStroke(this.stroke);
  }
}

export class UndoManager {
  private undoStack: UndoableAction[] = [];
  private redoStack: UndoableAction[] = [];
  private maxHistory = 30;
  private onChangeCallback: (() => void) | null = null;

  onChange(callback: () => void): void {
    this.onChangeCallback = callback;
  }

  pushAction(action: UndoableAction): void {
    this.undoStack.push(action);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    // Clear redo stack when new action is performed
    this.redoStack = [];
    this.notifyChange();
  }

  async undo(): Promise<boolean> {
    const action = this.undoStack.pop();
    if (!action) return false;

    await action.undo();
    this.redoStack.push(action);
    this.notifyChange();
    return true;
  }

  async redo(): Promise<boolean> {
    const action = this.redoStack.pop();
    if (!action) return false;

    await action.execute();
    this.undoStack.push(action);
    this.notifyChange();
    return true;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyChange();
  }

  private notifyChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
  }
}
