'use client';

import { useBoardStore } from '@/store/BoardStore';
import { get } from 'http';
import { useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import Column from '@/components/Column';

function Board() {

    const [board, getBoard, setBoardState, updateTodoInDB] = useBoardStore((state) => [
        state.board,
        state.getBoard,
        state.setBoardState,
        state.updateTodoInDB
    ]);

    useEffect(() => {
        getBoard();
    }, [getBoard])

    const handleOnDragEnd = (result: DropResult) => {

        const { destination, source, type } = result;

        // Check if user dragged outside the board
        if (!destination) return;

        // Handle column drag
        if (type == "column") {

            const entries = Array.from(board.columns.entries());
            const [removed] = entries.splice(source.index, 1);

            // Add the removed column to the destination index without removing anything
            entries.splice(destination.index, 0, removed);

            const rearrangedColumns = new Map(entries);


            // Keep everything same except the columns. ES6 spread operator
            setBoardState({
                ...board,
                columns: rearrangedColumns
            })
        }

        // This step is needed as the indexes are stored as number instead of id's with DND library

        const columns = Array.from(board.columns)
        const startColIndex = columns[Number(source.droppableId)]
        const endColIndex = columns[Number(destination.droppableId)]


        const startCol: Column = {
            id: startColIndex[0],
            todos: startColIndex[1].todos
        }

        const finishCol: Column = {
            id: endColIndex[0],
            todos: endColIndex[1].todos
        }

        
        if (!startCol || !finishCol) return;

        if (source.index === destination.index && startCol === finishCol) return;


        const newTodos = startCol.todos;

        const [todoMoved] = newTodos.splice(source.index, 1);

        if (startCol.id == finishCol.id) {
            // Same column drag
            newTodos.splice(destination.index, 0, todoMoved);
            const newCol = {
                id: startCol.id,
                todos: newTodos
            }

            const newColumns = new Map(board.columns);

            newColumns.set(newCol.id, newCol);

            setBoardState({
                ...board,
                columns: newColumns
            })

        } else {
            // Different column drag

            // Copy of finished column
            const finishTodos = finishCol.todos;

            // Add to the correct index
            finishTodos.splice(destination.index, 0, todoMoved);



            const newColumns = new Map(board.columns);
            const newCol = {
                id: startCol.id,
                todos: newTodos
            }

            newColumns.set(startCol.id, newCol);
            newColumns.set(finishCol.id, {
                id: finishCol.id,
                todos: finishTodos
            })

            // Update Database that the value has changed
            updateTodoInDB(todoMoved, finishCol.id);

            setBoardState({
                ...board,
                columns: newColumns
            })
        }


    }
    
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId='board' direction='horizontal' type="column">
            {(provided) => (
                <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                >
                    {
                        Array.from(board.columns.entries()).map(([id,column], index) => (
                            <Column 
                                key={id}
                                id={id}
                                todos={column.todos}
                                index={index}
                            />
                        ))
                    }
                </div>
            )}

            
        </Droppable>


    </DragDropContext>
  )
}

export default Board