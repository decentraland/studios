import React from 'react'

interface Props {
  gray?: boolean
}

function Empty({gray}: Props) {
  let fill = "#37333D"
  
  if (gray) {
    fill = "#989395"
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        fill={fill}
        d="M49.3319 0.161805C48.4941 0.497165 48.0621 0.819095 46.9869 1.89558L45.8983 3.00085L47.001 3.93718C50.1838 6.62198 52.8218 10.0761 54.7066 14.005C56.8289 18.4377 57.7082 22.3813 57.6801 27.3868C57.6666 32.2534 56.7034 36.3782 54.5805 40.727C48.592 52.9619 35.1482 59.744 21.6634 57.3107C14.9626 56.1088 8.66626 52.5011 4.18497 47.3407L2.98435 45.9571L1.90978 47.1033C-0.673267 49.8579 -0.645095 51.3126 2.04931 53.9551C7.78691 59.5903 15.2973 63.0444 23.618 63.8828C25.7959 64.1068 30.8359 63.9948 32.8596 63.6729C34.8557 63.3657 38.2343 62.4979 39.993 61.8553C41.8074 61.1839 45.2423 59.4918 46.8193 58.4991C49.081 57.0732 51.2589 55.3248 53.3108 53.2556C56.4372 50.1235 58.4621 47.2851 60.3604 43.3977C62.0634 39.902 63.1386 36.4761 63.7249 32.631C64.0462 30.519 64.1018 24.3942 63.8087 22.423C62.7751 15.5148 60.1652 9.47383 55.9207 4.17462C54.2593 2.09142 52.5562 0.497173 51.7044 0.218133C50.9236 -0.0474675 49.9463 -0.0756356 49.3319 0.161805Z"
      ></path>
      <path
        fill={fill}
        d="M24.567 24.6464L6.08374 43.1604L6.99128 44.2657C10.8857 48.9217 16.135 52.082 22.11 53.3402C24.455 53.8439 28.5177 53.9559 31.0028 53.6058C36.9216 52.7668 42.1145 50.1102 46.3309 45.7613C50.2528 41.7204 52.7379 36.6586 53.5193 31.0932C53.799 29.1911 53.7843 25.5136 53.5059 23.5706C52.7104 18.1447 50.2944 13.1668 46.4979 9.19555C45.2972 7.93667 43.3011 6.13379 43.1059 6.13379C43.0777 6.13315 34.7295 14.4666 24.567 24.6464ZM43.2172 15.2359C43.6921 15.4176 44.334 16.0052 44.5996 16.5082C44.9062 17.1092 44.8505 18.3124 44.4742 18.8717C43.7062 20.0039 42.0025 20.857 40.4255 20.8711C39.5603 20.8851 39.4342 20.8429 39.1827 20.5357C38.5964 19.8228 39.1411 17.6128 40.2579 16.1453C40.928 15.264 42.2259 14.8583 43.2172 15.2359ZM46.7071 27.1213C47.6006 27.5553 48.062 28.3936 47.9776 29.4708C47.8662 30.9812 46.6515 32.0013 45.1712 31.8061C43.6499 31.5962 41.8067 30.5754 41.3881 29.7089C41.1788 29.2749 41.1788 29.1629 41.3465 28.7578C41.598 28.1703 42.4076 27.5975 43.6217 27.1776C44.8364 26.7444 45.8975 26.7303 46.7071 27.1213ZM40.3692 37.5668C42.6176 38.6157 43.3708 40.2381 42.3379 41.8183C41.7235 42.7693 40.3833 43.1751 39.3081 42.7271C38.3865 42.3348 37.3119 40.7271 36.9766 39.1892C36.7673 38.2945 36.8934 37.6788 37.3676 37.3012C37.8982 36.882 39.1545 36.994 40.3692 37.5668ZM20.5183 39.2589C20.8114 39.4964 20.8537 39.6365 20.8396 40.4897C20.8262 42.0692 19.9743 43.7754 18.8434 44.5447C18.2847 44.9223 17.0847 44.9786 16.4838 44.6701C15.1993 43.9994 14.725 42.5729 15.3535 41.2865C16.1068 39.7204 19.4713 38.4065 20.5183 39.2589ZM29.9551 41.6084C30.6252 42.0557 31.5468 43.8874 31.742 45.1738C32.0633 47.314 29.829 48.8378 27.959 47.7332C26.7858 47.0484 26.4786 45.538 27.1353 43.6916C27.8751 41.5802 28.8383 40.8807 29.9551 41.6084Z"
      ></path>
    </svg>
  )
}

export default Empty
