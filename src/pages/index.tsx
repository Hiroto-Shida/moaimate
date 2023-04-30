import type { NextPage } from 'next'
import {
  Heading,
  Box,
  Image,
  Text,
  Center,
} from '@chakra-ui/react'
import styles from '../styles/Home.module.css'
import React, { CSSProperties } from 'react';

const text = 'モアイ像とは南太平洋に位置するイースター島（チリ領）にある巨石像のことを指します'
const sizePx = 500
const charStyle = (i: number) => {
  return {
    '--sizePx': `${sizePx}px`,
    '--sizePx-50': `${sizePx - 50}px`,
    '--sizePx-per2': `${sizePx / 2}px`,
    '--rotateDeg': `${i}deg`
  }
}
const sizeStyle: CSSProperties = {
  '--sizePx': `${sizePx}px`,
  '--sizePx-50': `${sizePx - 50}px`,
}


const Page: NextPage = () => {


  return (
    <div className={styles.circle} style={sizeStyle}>
      {/* <Center h='100%'> */}
      <Image
        src='/images/moai_normal.png'
        alt='moai'
        className={styles.logo}
        style={sizeStyle}
      />
      {/* </Center> */}
      <div className={styles.text}>
        {text.split('').map((char, i) => (
          <span key={i} className={styles.char} style={charStyle(i * 9)}>
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Page
