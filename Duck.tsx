'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import { Button } from "@/components/ui/button"

function Player({ position }) {
  const ref = useRef()
  const { camera } = useThree()
  
  useFrame(() => {
    if (ref.current) {
      camera.position.x = ref.current.position.x
      camera.position.z = ref.current.position.z + 5
      camera.position.y = ref.current.position.y + 3
      camera.lookAt(ref.current.position)
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}

function Duck({ position, onCollect }) {
  const { scene } = useGLTF("/assets/3d/duck.glb")
  const ref = useRef()

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01
    }
  })

  return (
    <primitive 
      ref={ref}
      object={scene.clone()} 
      position={position} 
      scale={[0.2, 0.2, 0.2]} 
      onClick={onCollect}
    />
  )
}

function GameScene({ playerPosition, ducks, collectDuck }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Player position={playerPosition} />
      {ducks.map(duck => (
        <Duck 
          key={duck.id} 
          position={duck.position} 
          onCollect={() => collectDuck(duck.id)} 
        />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <Environment preset="forest" />
      <OrbitControls enableZoom={false} />
    </>
  )
}

export default function Game() {
  const [playerPosition, setPlayerPosition] = useState([0, 0.5, 0])
  const [ducks, setDucks] = useState([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    spawnDucks()
  }, [])

  const spawnDucks = () => {
    const newDucks = []
    for (let i = 0; i < 5; i++) {
      newDucks.push({
        id: i,
        position: [
          Math.random() * 10 - 5,
          0.5,
          Math.random() * 10 - 5
        ]
      })
    }
    setDucks(newDucks)
  }

  const collectDuck = (id) => {
    setDucks(ducks.filter(duck => duck.id !== id))
    setScore(score + 1)
    if (score + 1 >= 5) {
      setGameOver(true)
    }
  }

  const movePlayer = (direction) => {
    setPlayerPosition(prev => {
      const newPos = [...prev]
      switch(direction) {
        case 'left':
          newPos[0] -= 0.5
          break
        case 'right':
          newPos[0] += 0.5
          break
        case 'up':
          newPos[2] -= 0.5
          break
        case 'down':
          newPos[2] += 0.5
          break
      }
      return newPos
    })
  }

  const restartGame = () => {
    setScore(0)
    setGameOver(false)
    setPlayerPosition([0, 0.5, 0])
    spawnDucks()
  }

  return (
    <div className="relative w-full h-screen">
      <Canvas>
        <GameScene 
          playerPosition={playerPosition}
          ducks={ducks}
          collectDuck={collectDuck}
        />
      </Canvas>
      <div className="absolute top-4 left-4 text-white text-xl">
        Score: {score}
      </div>
      <div className="absolute bottom-4 left-4 space-x-2">
        <Button onMouseDown={() => movePlayer('left')} onMouseUp={() => {}} aria-label="Move left">
          Left
        </Button>
        <Button onMouseDown={() => movePlayer('right')} onMouseUp={() => {}} aria-label="Move right">
          Right
        </Button>
        <Button onMouseDown={() => movePlayer('up')} onMouseUp={() => {}} aria-label="Move up">
          Up
        </Button>
        <Button onMouseDown={() => movePlayer('down')} onMouseUp={() => {}} aria-label="Move down">
          Down
        </Button>
      </div>
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">¡Juego Completado!</h2>
            <p className="text-2xl text-white mb-4">Recolectaste todos los patos</p>
            <Button onClick={restartGame}>Reiniciar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
